package com.ptit.onlinelearning.service.auth;

import com.ptit.onlinelearning.request.ChangePasswordWithTokenRequest;
import com.ptit.onlinelearning.request.UserRegisterRequest;
import com.ptit.onlinelearning.request.VerifyRequest;
import com.ptit.onlinelearning.response.auth.UserRegisterResponse;

public interface IAuthService {

    UserRegisterResponse register(UserRegisterRequest userRegisterRequest);
    
    boolean verifyUser(VerifyRequest verifyRequest);

    String login(String email, String password);

    void resendOtp(String email);

    String processForgotPassword(String email);

    String verifyForgotPassword(VerifyRequest verifyRequest);

    String changePassword(ChangePasswordWithTokenRequest changePasswordWithTokenRequest);

}
