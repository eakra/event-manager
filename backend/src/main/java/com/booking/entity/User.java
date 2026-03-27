package com.booking.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, length = 150)
    public String name;

    @Column(nullable = false, unique = true, length = 200)
    public String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    @JsonIgnore
    public String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public UserRole role = UserRole.STAFF;

    @Column(name = "max_hours_per_week", nullable = false)
    public Integer maxHoursPerWeek = 40;

    @Column(name = "date_of_birth")
    public java.time.LocalDate dateOfBirth;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_tags",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    public Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    public List<UserAvailability> availability = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    public List<UserHoliday> holidays = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    public List<EventAssignment> assignments = new ArrayList<>();

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}
