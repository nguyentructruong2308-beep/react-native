import { DataProvider, fetchUtils } from 'react-admin';

const apiUrl = 'http://localhost:8080/api';

const httpClient = (url: string, options: any = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }

    const token = localStorage.getItem('jwt-token');
    if (token) {
        options.headers.set('Authorization', `Bearer ${token}`);
    }

    return fetchUtils.fetchJson(url, options);
};

const idMap: any = {
    products: 'productId',
    categories: 'categoryId',
    users: 'userId',
    orders: 'orderId',
    carts: 'cartId',
    vouchers: 'voucherId'
};

// 🔥 FIX ẢNH
const fixImage = (item: any) => {
    if (item.image) {
        // Nếu image chưa phải là link full thì thêm prefix vào
        if (!item.image.startsWith('http')) {
             item.imageUrl = `${apiUrl}/public/products/image/${item.image}`;
        } else {
             item.imageUrl = item.image;
        }
    }
    return item;
};

export const dataProvider: DataProvider = {

    getList: async (resource, { pagination = {}, sort = {}, filter = {} }) => {
        const { page = 1, perPage = 10 } = pagination;
        const { field = 'id', order = 'ASC' } = sort;

        const idField = idMap[resource] || 'id';

        const query: any = {
            pageNumber: page - 1,
            pageSize: perPage,
            sortBy: field === 'id' ? idField : field,
            sortOrder: order,
            ...filter
        };

        // Mặc định gọi public
        let url = `${apiUrl}/public/${resource}?${new URLSearchParams(query).toString()}`;

        if (resource === 'products' && filter.search) {
            url = `${apiUrl}/public/products/keyword/${filter.search}?${new URLSearchParams(query).toString()}`;
        }

        // ✅ QUAN TRỌNG: Ép buộc các resource quản trị dùng prefix /admin
        if (resource === 'users' || resource === 'orders' || resource === 'carts' || resource === 'vouchers') {
            url = `${apiUrl}/admin/${resource}?${new URLSearchParams(query).toString()}`;
        }

        const { json } = await httpClient(url);

        // API Spring trả về PageImpl có content
        const data = json.content ? json.content : (Array.isArray(json) ? json : []);
        const total = json.totalElements !== undefined ? json.totalElements : data.length;

        return {
            data: data.map((item: any) => {
                const fixed = fixImage(item);
                return { ...fixed, id: fixed[idField] };
            }),
            total: total,
        };
    },

    getOne: async (resource, params) => {
        let prefix = 'public';
        
        // ✅ Carts trong Admin cần dùng prefix /admin/ để lấy chi tiết
        if (resource === 'users' || resource === 'orders' || resource === 'carts' || resource === 'vouchers') {
            prefix = 'admin';
        } 
        
        const url = `${apiUrl}/${prefix}/${resource}/${params.id}`;
        
        const { json } = await httpClient(url);
        const idField = idMap[resource] || 'id';

        const fixed = fixImage(json);
        return { data: { ...fixed, id: fixed[idField] } };
    },

    // 🧨 CREATE — FIX UPLOAD ẢNH & MULTIPART
    create: async (resource, params) => {
        
        // [FIX 415 ERROR] Xử lý riêng cho Category (Gửi Multipart)
        if (resource === 'categories' || resource === 'admin/categories') {
            const formData = new FormData();
            
            // 1. Lấy file ảnh
            if (params.data.image && params.data.image.rawFile) {
                formData.append('image', params.data.image.rawFile);
            }

            // 2. Gom data thành JSON Blob
            const categoryData = { categoryName: params.data.categoryName };
            const jsonBlob = new Blob([JSON.stringify(categoryData)], { type: 'application/json' });
            formData.append('category', jsonBlob);

            // Gửi bằng fetch trực tiếp để browser tự set Content-Type multipart boundary
            const response = await fetch(`${apiUrl}/admin/categories`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwt-token')}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }
            
            const json = await response.json();
            return { data: { ...json, id: json.categoryId } };
        }

        // Logic cũ cho Products và các resource khác
        let url = `${apiUrl}/admin/${resource}`;

        if (resource === 'products' && params.data.categoryId) {
            url = `${apiUrl}/admin/categories/${params.data.categoryId}/product`; 
        }

        const { json: created } = await httpClient(url, {
            method: 'POST',
            body: JSON.stringify(params.data),
        });

        const idField = idMap[resource] || 'id';
        const productId = created[idField];

        // Upload ảnh riêng cho Product
        if (resource === 'products' && params.data.imageFile?.rawFile) {
            const formData = new FormData();
            formData.append('image', params.data.imageFile.rawFile);

            await fetch(`${apiUrl}/admin/products/${productId}/image`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwt-token')}`,
                },
                body: formData,
            });
        }

        const fixed = fixImage(created);
        return { data: { ...fixed, id: productId } };
    },

    // 🧨 UPDATE — FIX UPLOAD ẢNH & MULTIPART
    update: async (resource, params) => {
        
        // [FIX 415 ERROR] Xử lý riêng cho Category (Gửi Multipart)
        if (resource === 'categories' || resource === 'admin/categories') {
            const formData = new FormData();
            
            // 1. Lấy file ảnh
            if (params.data.image && params.data.image.rawFile) {
                formData.append('image', params.data.image.rawFile);
            }

            // 2. Gom data JSON
            const categoryData = { 
                categoryId: params.data.categoryId,
                categoryName: params.data.categoryName 
            };
            const jsonBlob = new Blob([JSON.stringify(categoryData)], { type: 'application/json' });
            formData.append('category', jsonBlob);

            const response = await fetch(`${apiUrl}/admin/categories/${params.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwt-token')}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const json = await response.json();
            return { data: { ...json, id: json.categoryId } };
        }

        // Logic cũ cho các resource khác (JSON thuần)
        const { imageFile, ...safeData } = params.data;
        const url = `${apiUrl}/admin/${resource}/${params.id}`;

        const { json } = await httpClient(url, {
            method: 'PUT',
            body: JSON.stringify(safeData),
        });

        const idField = idMap[resource] || 'id';
        const fixed = fixImage(json);
        return { data: { ...fixed, id: fixed[idField] } };
    },

    delete: async (resource, params) => {
        await httpClient(`${apiUrl}/admin/${resource}/${params.id}`, { method: 'DELETE' });
        return { data: params.previousData as any };
    },

    deleteMany: async (resource, params) => {
        await Promise.all(params.ids.map(id =>
            httpClient(`${apiUrl}/admin/${resource}/${id}`, { method: 'DELETE' })
        ));
        return { data: params.ids };
    },

    getMany: () => Promise.resolve({ data: [] }),
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    updateMany: () => Promise.resolve({ data: [] }),
};