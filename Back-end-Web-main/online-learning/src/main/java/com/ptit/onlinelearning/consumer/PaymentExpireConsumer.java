package com.ptit.onlinelearning.consumer;


import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.config.RabbitMQConfig;
import com.ptit.onlinelearning.model.Order;
import com.ptit.onlinelearning.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentExpireConsumer {

    private final OrderRepository orderRepository;

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_EXPIRE_QUEUE)
    public void handleOrderExpire(String orderNumber) {
        Optional<Order> optionalOrder = orderRepository.findByOrderNumber(orderNumber);
        if (optionalOrder.isEmpty()) {
            return;
        }
        Order order = optionalOrder.get();
        if (order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.EXPIRED);
            orderRepository.save(order);
           log.info("Order {} has expired due to non-payment.", orderNumber);
        } else {
            log.info("Order {} is already processed with status: {}. No action taken.", orderNumber, order.getPaymentStatus());
        }
    }
}
