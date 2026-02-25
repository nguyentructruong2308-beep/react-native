package com.trannam.example05;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.trannam.example05.config.AppConstants;
import com.trannam.example05.entity.Role;
import com.trannam.example05.repository.RoleRepo;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import com.trannam.example05.entity.Voucher;
import com.trannam.example05.repository.VoucherRepository;
import java.util.List;

@SpringBootApplication
@SecurityScheme(name = "E-Commerce Application", scheme = "bearer", type = SecuritySchemeType.HTTP, in = SecuritySchemeIn.HEADER)
public class Example05Application implements CommandLineRunner {
    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private VoucherRepository voucherRepository;

    public static void main(String[] args) {
        SpringApplication.run(Example05Application.class, args);
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            Role adminRole = new Role();
            adminRole.setRoleId(AppConstants.ADMIN_ID);
            adminRole.setRoleName("ADMIN");

            Role userRole = new Role();
            userRole.setRoleId(AppConstants.USER_ID);
            userRole.setRoleName("USER");

            List<Role> roles = List.of(adminRole, userRole);
            roleRepo.saveAll(roles);

            // 🔥 Khởi tạo Voucher mẫu
            if (voucherRepository.findAll().isEmpty()) {
                Voucher v1 = new Voucher(null, "GIAM10", 10.0, "PERCENTAGE", 100000.0,
                        java.time.LocalDate.now().plusMonths(1), true);
                Voucher v2 = new Voucher(null, "FREESHIP", 15000.0, "FIXED", 50000.0,
                        java.time.LocalDate.now().plusMonths(1), true);
                Voucher v3 = new Voucher(null, "GIAM20K", 20000.0, "FIXED", 0.0,
                        java.time.LocalDate.now().plusMonths(1), true);
                voucherRepository.saveAll(List.of(v1, v2, v3));
                System.out.println(">> [DEBUG] Initialized sample vouchers.");
            }

            roles.forEach(System.out::println);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}