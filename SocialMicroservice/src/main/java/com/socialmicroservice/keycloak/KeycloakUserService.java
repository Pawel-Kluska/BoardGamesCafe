package com.socialmicroservice.keycloak;

import com.socialmicroservice.dto.UserDto;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

@Service
public class KeycloakUserService {

    private final Keycloak keycloak;
    private final String realm = "master";

    public KeycloakUserService() {
        this.keycloak = KeycloakBuilder.builder()
                .serverUrl("http://localhost:8080")
                .realm("master")
                .username("admin")
                .password("adminpass")
                .clientId("admin-cli")
                .grantType(OAuth2Constants.PASSWORD)
                .build();
    }

    public List<UserDto> getAllUsers() {
        return keycloak.realm(realm).users().list()
                .stream()
                .filter(u -> !u.getUsername().equals("admin"))
                .map(user -> new UserDto(user.getEmail(), user.getFirstName(), user.getLastName()))
                .toList();
    }
}
