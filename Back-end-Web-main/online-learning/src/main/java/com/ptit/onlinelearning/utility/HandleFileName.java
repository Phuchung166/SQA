package com.ptit.onlinelearning.utility;


import org.springframework.stereotype.Component;

import java.text.Normalizer;

@Component
public class HandleFileName {


    public static  String determineDirectory(String extension) {
        if (extension == null) {
            return "documents";
        }

        String lowerExtension = extension.toLowerCase();
        if (isImageFile(lowerExtension)) {
            return "images";
        } else if (isVideoFile(lowerExtension)) {
            return "videos";
        } else {
            return "documents";
        }
    }

    public static boolean isImageFile(String extension) {
        return extension.matches("jpg|jpeg|png|gif|bmp|svg|webp|tiff|ico");
    }

    public static boolean isVideoFile(String extension) {
        return extension.matches("mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp|mpg|mpeg");
    }

    public static String buildFilePathWithDirectory(String directory, String filename) {
        return directory + "/" + filename;
    }

    public static String buildFilename(String filename) {
        return String.format("%s_%s", System.currentTimeMillis(), sanitizeFileName(filename));
    }

    private static String sanitizeFileName(String fileName) {
        String normalizedFileName = Normalizer.normalize(fileName, Normalizer.Form.NFKD);
        return normalizedFileName.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9.\\-_]", "");
    }
}
