package com.example.smart_waste_collection.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ActiveRequestExistsException extends RuntimeException {

    public ActiveRequestExistsException(String message) {
        super(message);
    }
}