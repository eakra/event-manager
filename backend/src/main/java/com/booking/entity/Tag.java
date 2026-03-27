package com.booking.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "tags")
public class Tag extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    public String name;

    @ManyToMany(mappedBy = "tags")
    @JsonIgnore
    public Set<User> users = new HashSet<>();

    @ManyToMany(mappedBy = "requiredTags")
    @JsonIgnore
    public Set<EventType> eventTypes = new HashSet<>();
}
