package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.backend.dto.TableStatusUpdateEvent;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/table.subscribe")
    @SendTo("/topic/tables")
    public TableStatusUpdateEvent handleTableSubscription(TableStatusUpdateEvent event) {
        return event;
    }

    public void broadcastTableUpdate(TableStatusUpdateEvent event) {
        messagingTemplate.convertAndSend("/topic/tables", event);
    }

    public void broadcastOrderUpdate(Object orderEvent) {
        messagingTemplate.convertAndSend("/topic/orders", orderEvent);
    }
}
