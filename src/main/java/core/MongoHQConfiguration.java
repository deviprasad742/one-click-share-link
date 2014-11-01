package core;

import java.net.UnknownHostException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.MongoException;

@Configuration
public class MongoHQConfiguration {

    public @Bean MongoDbFactory mongoDbFactory() throws MongoException, UnknownHostException {
    	MongoClientURI mongoClientURI = new MongoClientURI(System.getenv("MONGOHQ_URL"));
		return new SimpleMongoDbFactory(new MongoClient(mongoClientURI), mongoClientURI.getDatabase());
    }

    public @Bean MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongoDbFactory());
    }
}