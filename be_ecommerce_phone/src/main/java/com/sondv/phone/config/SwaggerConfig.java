package com.sondv.phone.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Phone Store API",
                version = "1.0",
                description = "API quản lý cửa hàng bán điện thoại"
        )
)
public class SwaggerConfig {
}
