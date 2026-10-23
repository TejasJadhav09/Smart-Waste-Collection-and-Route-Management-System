package com.example.smart_waste_collection.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "route_stops")
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int stopOrder;

    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne
    @JoinColumn(name = "collection_request_id", nullable = false)
    private CollectionRequest collectionRequest;

    public RouteStop() {
    }

    public RouteStop(int stopOrder,
                     Route route,
                     CollectionRequest collectionRequest) {
        this.stopOrder = stopOrder;
        this.route = route;
        this.collectionRequest = collectionRequest;
    }

    public int getId() {
        return id;
    }

    public int getStopOrder() {
        return stopOrder;
    }

    public Route getRoute() {
        return route;
    }

    public CollectionRequest getCollectionRequest() {
        return collectionRequest;
    }

    public void setStopOrder(int stopOrder) {
        this.stopOrder = stopOrder;
    }

    public void setRoute(Route route) {
        this.route = route;
    }

    public void setCollectionRequest(CollectionRequest collectionRequest) {
        this.collectionRequest = collectionRequest;
    }
}