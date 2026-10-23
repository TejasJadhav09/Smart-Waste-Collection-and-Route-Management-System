
package com.example.smart_waste_collection.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex) {

        Map<String, String> response = Map.of(
                "error", ex.getMessage() != null
                        ? ex.getMessage()
                        : "An unexpected error occurred"
        );

       

String message = ex.getMessage();

HttpStatus status;

if ("No unrouted collection requests available".equals(message)) {
    status = HttpStatus.BAD_REQUEST;
} else if (message != null && (
        message.contains("not available for a new route")
        || message.contains("already added to this route")
)) {
    status = HttpStatus.CONFLICT;
} else {
    status = HttpStatus.INTERNAL_SERVER_ERROR;
}

        return ResponseEntity.status(status).body(response);
    }
}
