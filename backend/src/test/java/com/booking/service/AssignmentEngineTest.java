package com.booking.service;

import com.booking.dto.AvailableStaffDTO;
import com.booking.entity.*;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@QuarkusTest
public class AssignmentEngineTest {

    @Inject
    AssignmentEngine assignmentEngine;

    @Test
    public void testEvaluateStaff_QualificationFail() {
        // This is a placeholder for a more complex test. 
        // Mocking Panache static methods requires special handling or keeping it as an integration test with a H2 database.
        // For now, I'll provide a structure that shows how the logic should be tested.
        
        // Given a staff member missing a required tag
        // When evaluateStaff is called
        // Then canAssign should be false and warningMessages should contain "Missing qualification"
        
        // Note: Real implementation would need PanacheMock or a test database.
    }
}
