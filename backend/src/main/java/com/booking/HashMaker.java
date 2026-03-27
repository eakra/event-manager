package com.booking;
import org.mindrot.jbcrypt.BCrypt;
public class HashMaker {
    public static void main(String[] args) {
        System.out.println("HASH_IS:" + BCrypt.hashpw("admin123", BCrypt.gensalt(10)));
    }
}
