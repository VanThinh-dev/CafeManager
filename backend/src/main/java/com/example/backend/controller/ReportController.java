package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ReportResponse;
import com.example.backend.service.ReportService;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/today")
    public ResponseEntity<ReportResponse> getTodayReport() {
        return ResponseEntity.ok(reportService.getTodayReport());
    }

    @GetMapping("/date")
    public ResponseEntity<ReportResponse> getReportByDate(@RequestParam("date") String date) {
        return ResponseEntity.ok(reportService.getReportByDate(date));
    }
}