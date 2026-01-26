package com.ptit.onlinelearning.producer;


import com.ptit.onlinelearning.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {
    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    public void sendEmail(Object payload) {
        rabbitTemplate.convertAndSend(exchange, "email.send", payload);
    }

    public void scheduleOrderExpiration(String orderNumber, int minutes) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PAYMENT_EXPIRE_EXCHANGE,
                RabbitMQConfig.PAYMENT_EXPIRE_ROUTING_KEY,
                orderNumber,
                message -> {
                    message.getMessageProperties()
                            .setHeader("x-delay", minutes * 60 * 1000+ 3000); // Delay in milliseconds
                    return message;
                }
        );
    }

    public void schedulePreOrderExpiration(Long courseId, LocalDateTime preOrderEndDate) {
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(now, preOrderEndDate);
        long delayMillis = duration.toMillis();
        
        // Only schedule if the end date is in the future
        if (delayMillis > 0) {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PREORDER_EXPIRE_EXCHANGE,
                    RabbitMQConfig.PREORDER_EXPIRE_ROUTING_KEY,
                    courseId,
                    message -> {
                        message.getMessageProperties()
                                .setHeader("x-delay", delayMillis);
                        return message;
                    }
            );
            log.info("Scheduled pre-order expiration for course ID {} at {}, delay: {} ms", 
                    courseId, preOrderEndDate, delayMillis);
        } else {
            log.warn("Pre-order end date {} is in the past for course ID {}. Not scheduling expiration.", 
                    preOrderEndDate, courseId);
        }
    }

    public void schedulePreOrderGroupExpiration(Long courseGroupId, LocalDateTime preOrderEndDate) {
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(now, preOrderEndDate);
        long delayMillis = duration.toMillis();
        
        // Only schedule if the end date is in the future
        if (delayMillis > 0) {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.PREORDER_GROUP_EXPIRE_EXCHANGE,
                    RabbitMQConfig.PREORDER_GROUP_EXPIRE_ROUTING_KEY,
                    courseGroupId,
                    message -> {
                        message.getMessageProperties()
                                .setHeader("x-delay", delayMillis);
                        return message;
                    }
            );
            log.info("Scheduled pre-order group expiration for course group ID {} at {}, delay: {} ms", 
                    courseGroupId, preOrderEndDate, delayMillis);
        } else {
            log.warn("Pre-order end date {} is in the past for course group ID {}. Not scheduling expiration.", 
                    preOrderEndDate, courseGroupId);
        }
    }
}
