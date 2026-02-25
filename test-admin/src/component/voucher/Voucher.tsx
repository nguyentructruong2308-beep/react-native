import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    BooleanField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    DateInput,
    BooleanInput,
    SelectInput,
    EditButton,
    DeleteButton
} from "react-admin";

export const VoucherList = () => (
    <List title="Quản lý Voucher" sx={{ mt: 2 }}>
        <Datagrid rowClick="edit">
            <TextField source="voucherId" label="ID" />
            <TextField source="code" label="Mã Voucher" sx={{ fontWeight: 'bold' }} />
            <NumberField source="discountAmount" label="Giá trị giảm" />
            <TextField source="discountType" label="Loại" />
            <NumberField source="minOrderAmount" label="Đơn tối thiểu" />
            <DateField source="expiryDate" label="Ngày hết hạn" />
            <BooleanField source="active" label="Trạng thái" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

const discountTypeChoices = [
    { id: 'PERCENTAGE', name: 'Phần trăm (%)' },
    { id: 'FIXED', name: 'Số tiền cố định (đ)' },
];

export const VoucherEdit = () => (
    <Edit title="Chỉnh sửa Voucher">
        <SimpleForm>
            <TextInput source="code" label="Mã Voucher" fullWidth />
            <SelectInput source="discountType" label="Loại giảm giá" choices={discountTypeChoices} fullWidth />
            <NumberInput source="discountAmount" label="Giá trị giảm" fullWidth />
            <NumberInput source="minOrderAmount" label="Giá trị đơn tối thiểu" fullWidth />
            <DateInput source="expiryDate" label="Ngày hết hạn" fullWidth />
            <BooleanInput source="active" label="Đang kích hoạt" />
        </SimpleForm>
    </Edit>
);

export const VoucherCreate = () => (
    <Create title="Tạo Voucher mới">
        <SimpleForm>
            <TextInput source="code" label="Mã Voucher" fullWidth />
            <SelectInput source="discountType" label="Loại giảm giá" choices={discountTypeChoices} fullWidth />
            <NumberInput source="discountAmount" label="Giá trị giảm" fullWidth />
            <NumberInput source="minOrderAmount" label="Giá trị đơn tối thiểu" fullWidth />
            <DateInput source="expiryDate" label="Ngày hết hạn" fullWidth />
            <BooleanInput source="active" label="Đang kích hoạt" defaultValue={true} />
        </SimpleForm>
    </Create>
);
