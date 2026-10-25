package com.rudypp;

import com.rudypp.system.config.InMemoryRedisTestConfiguration;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * @author Rudy Lyu
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@Import(InMemoryRedisTestConfiguration.class)
class RudyPPApplicationTests {

    @Test
    void contextLoads() {
    }

}
