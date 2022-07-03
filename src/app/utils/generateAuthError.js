export function generateAuthError(message) {
    switch (message) {
        case "EMAIL_EXISTS":
            return "The user with this email exists";
        case "INVALID_PASSWORD":
            return "The password is invalid or the user does not have a password";
        default:
            return "Too much trying, try later please";
    }
}
