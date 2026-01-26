package com.ptit.onlinelearning.model;

import lombok.*;

import java.io.Serializable;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserRoleId implements Serializable {
    private Long userId;
    private Integer roleId;
}
