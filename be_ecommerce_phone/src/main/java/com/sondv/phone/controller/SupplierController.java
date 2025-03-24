package com.sondv.phone.controller;

import com.sondv.phone.model.Supplier;
import com.sondv.phone.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/suppliers")
@PreAuthorize("hasRole('ADMIN')")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        System.out.println("Fetching all suppliers");
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        System.out.println("Fetching supplier with ID: " + id);
        Optional<Supplier> supplier = supplierService.getSupplierById(id);
        return supplier.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Supplier> searchSuppliers(@RequestParam(required = false) String name,
                                          @RequestParam(required = false) String email) {
        if (name != null) {
            System.out.println("Searching suppliers by name: " + name);
            return supplierService.searchSuppliersByName(name);
        } else if (email != null) {
            System.out.println("Searching suppliers by email: " + email);
            return supplierService.searchSuppliersByEmail(email);
        }
        System.out.println("Fetching all suppliers (no search params)");
        return supplierService.getAllSuppliers();
    }

    @PostMapping
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        System.out.println("Creating supplier: " + supplier);
        return supplierService.saveSupplier(supplier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @RequestBody Supplier supplierDetails) {
        System.out.println("Received PUT request to update supplier with ID: " + id);
        System.out.println("Supplier details received: " + supplierDetails);
        try {
            Supplier updatedSupplier = supplierService.updateSupplier(id, supplierDetails);
            System.out.println("Supplier updated successfully: " + updatedSupplier);
            return ResponseEntity.ok(updatedSupplier);
        } catch (ConstraintViolationException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Số điện thoại không hợp lệ: " + e.getMessage());
        } catch (RuntimeException e) {
            System.err.println("Error updating supplier with ID " + id + ": " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        System.out.println("Deleting supplier with ID: " + id);
        supplierService.deleteSupplier(id);
        System.out.println("Delete successful for ID: " + id);
        return ResponseEntity.noContent().build();
    }
}