package core;

import org.springframework.data.mongodb.repository.MongoRepository;

import core.model.User;

public interface UserRepository extends MongoRepository<User, String> {

    public User findByEmailId(String emailId);

}
