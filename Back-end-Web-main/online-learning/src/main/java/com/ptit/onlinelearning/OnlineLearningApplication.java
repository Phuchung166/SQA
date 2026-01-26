package com.ptit.onlinelearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class OnlineLearningApplication {

	public static void main(String[] args) {
		ApplicationContext context=SpringApplication.run(OnlineLearningApplication.class, args);
//		JwtTokenUtils jwtTokenUtils = context.getBean(JwtTokenUtils.class);
//		System.out.println("Secret key: "+jwtTokenUtils.generateSecretKey());

	}

}
