package com.adminmicroservice.rabbit;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String ADMIN_RPC_QUEUE = "admin.rpc.queue";

    @Bean
    public Queue adminQueue() {
        return new Queue(ADMIN_RPC_QUEUE);
    }
}
