package com.rudypp.system.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * @author Rudy Lyu
 * Replaces Redis with an in-memory map so the tests need no Redis server (the Jenkins server has none).
 * Redis auto-configuration is excluded in src/test/resources/application.properties, so nothing ever connects to Redis.
 * Supports the operations the application uses: opsForValue().set / get and delete(key).
 */
@TestConfiguration(proxyBeanMethods = false)
public class InMemoryRedisTestConfiguration {

    /**
     * Only needed so RedisConfig can build its RedisTemplate bean; it is never used to connect
     */
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return mock(RedisConnectionFactory.class);
    }

    @Bean
    @SuppressWarnings("unchecked")
    public StringRedisTemplate stringRedisTemplate() {
        Map<String, String> store = new ConcurrentHashMap<>();
        StringRedisTemplate template = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(template.opsForValue()).thenReturn(valueOperations);
        // Expiry is ignored: no test runs long enough for a token to expire
        doAnswer(invocation -> store.put(invocation.getArgument(0), invocation.getArgument(1)))
                .when(valueOperations).set(anyString(), anyString(), any(Duration.class));
        doAnswer(invocation -> store.put(invocation.getArgument(0), invocation.getArgument(1)))
                .when(valueOperations).set(anyString(), anyString());
        when(valueOperations.get(any())).thenAnswer(invocation -> store.get(invocation.<String>getArgument(0)));
        when(template.delete(anyString())).thenAnswer(invocation -> store.remove(invocation.<String>getArgument(0)) != null);
        return template;
    }
}
