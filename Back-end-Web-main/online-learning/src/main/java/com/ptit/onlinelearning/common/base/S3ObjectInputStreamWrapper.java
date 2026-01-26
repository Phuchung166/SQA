package com.ptit.onlinelearning.common.base;

import java.io.InputStream;

public record S3ObjectInputStreamWrapper(InputStream inputStream, String eTag) {
}
