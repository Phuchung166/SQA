package com.ptit.onlinelearning.config;


import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.email.send.queue}")
    private String emailSendQueue;

    public static final String PAYMENT_EXPIRE_EXCHANGE = "payment.expire.exchange";
    public static final String PAYMENT_EXPIRE_QUEUE = "payment.expire.queue";
    public static final String PAYMENT_EXPIRE_ROUTING_KEY = "payment.expire";

    public static final String PREORDER_EXPIRE_EXCHANGE = "preorder.expire.exchange";
    public static final String PREORDER_EXPIRE_QUEUE = "preorder.expire.queue";
    public static final String PREORDER_EXPIRE_ROUTING_KEY = "preorder.expire";

    public static final String PREORDER_GROUP_EXPIRE_EXCHANGE = "preorder.group.expire.exchange";
    public static final String PREORDER_GROUP_EXPIRE_QUEUE = "preorder.group.expire.queue";
    public static final String PREORDER_GROUP_EXPIRE_ROUTING_KEY = "preorder.group.expire";


    @Bean
    public TopicExchange appExchange() {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    public CustomExchange delayedExchange() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-delayed-type", "direct");
        return new CustomExchange(
                PAYMENT_EXPIRE_EXCHANGE,
                "x-delayed-message",
                true,
                false,
                args
        );
    }

    @Bean
    public CustomExchange preOrderDelayedExchange() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-delayed-type", "direct");
        return new CustomExchange(
                PREORDER_EXPIRE_EXCHANGE,
                "x-delayed-message",
                true,
                false,
                args
        );
    }

    @Bean
    public CustomExchange preOrderGroupDelayedExchange() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-delayed-type", "direct");
        return new CustomExchange(
                PREORDER_GROUP_EXPIRE_EXCHANGE,
                "x-delayed-message",
                true,
                false,
                args
        );
    }

    @Bean
    public Queue emailSendQueue() {
        return QueueBuilder.durable(emailSendQueue).build();
    }

    @Bean
    public Queue expireQueue() {
        return QueueBuilder.durable(PAYMENT_EXPIRE_QUEUE).build();
    }

    @Bean
    public Queue preOrderExpireQueue() {
        return QueueBuilder.durable(PREORDER_EXPIRE_QUEUE).build();
    }

    @Bean
    public Queue preOrderGroupExpireQueue() {
        return QueueBuilder.durable(PREORDER_GROUP_EXPIRE_QUEUE).build();
    }

    @Bean
    public Binding bindEmailSend() {
        return BindingBuilder
                .bind(emailSendQueue())
                .to(appExchange())
                .with("email.send");
    }

    @Bean
    public Binding bindingExpire() {
        return BindingBuilder
                .bind(expireQueue())
                .to(delayedExchange())
                .with(PAYMENT_EXPIRE_ROUTING_KEY)
                .noargs();
    }

    @Bean
    public Binding bindingPreOrderExpire() {
        return BindingBuilder
                .bind(preOrderExpireQueue())
                .to(preOrderDelayedExchange())
                .with(PREORDER_EXPIRE_ROUTING_KEY)
                .noargs();
    }

    @Bean
    public Binding bindingPreOrderGroupExpire() {
        return BindingBuilder
                .bind(preOrderGroupExpireQueue())
                .to(preOrderGroupDelayedExchange())
                .with(PREORDER_GROUP_EXPIRE_ROUTING_KEY)
                .noargs();
    }
    @Bean
    public Declarables declarables() {
        return new Declarables(
                appExchange(),
                delayedExchange(),
                preOrderDelayedExchange(),
                preOrderGroupDelayedExchange(),
                emailSendQueue(),
                expireQueue(),
                preOrderExpireQueue(),
                preOrderGroupExpireQueue(),
                bindEmailSend(),
                bindingExpire(),
                bindingPreOrderExpire(),
                bindingPreOrderGroupExpire()
        );
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

}
