package com.trannam.example05.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.trannam.example05.entity.Address;
import java.util.List; // Thêm import này

@Repository
public interface AddressRepo extends JpaRepository<Address, Long> {

    Address findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
        String country, String state, String city, String pincode, String street, String buildingName);

    // [ĐÃ SỬA]: Thay Address thành List<Address> để lấy toàn bộ địa chỉ của user
    @Query("SELECT a FROM Address a JOIN a.users u WHERE u.email = :email")
    List<Address> findByUserEmail(@Param("email") String email); 
}