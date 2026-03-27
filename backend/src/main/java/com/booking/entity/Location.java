package com.booking.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "locations")
public class Location extends BaseEntity {

    @Column(nullable = false, length = 200)
    public String name;

    @Column(name = "address_line1", length = 255)
    public String addressLine1;

    @Column(name = "address_line2", length = 255)
    public String addressLine2;

    @Column(length = 100)
    public String city;

    @Column(name = "zip_code", length = 20)
    public String zipCode;

    @Column(name = "contact_name", length = 150)
    public String contactName;

    @Column(name = "contact_phone", length = 50)
    public String contactPhone;

    @Column(name = "contact_email", length = 150)
    public String contactEmail;

    @Column(name = "default_capacity")
    public Integer defaultCapacity;
}
