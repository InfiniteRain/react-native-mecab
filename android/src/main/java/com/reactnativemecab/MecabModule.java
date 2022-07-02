package com.reactnativemecab;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.util.HashMap;
import java.util.UUID;

@ReactModule(name = MecabModule.NAME)
public class MecabModule extends ReactContextBaseJavaModule {
    private static final HashMap<String, Long> PTR_MAP = new HashMap();
    public static final String NAME = "Mecab";

    public MecabModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    static {
        try {
            System.loadLibrary("cpp");
        } catch (Exception ignored) {
        }
    }

    @ReactMethod
    public void initTagger(String dicdir, Promise promise) {
        long mecabPtr = nativeInitTagger(dicdir);
        UUID uuid = UUID.randomUUID();
        String key = uuid.toString();

        PTR_MAP.put(key, mecabPtr);

        promise.resolve(key);
    }

    @ReactMethod
    public void parse(String ptrKey, String query, Promise promise) {
        try {
            Long ptr = getPtr(ptrKey);
            promise.resolve(nativeParse(ptr.longValue(), query));
        } catch (Exception e) {
            promise.reject(e.getMessage());
        }
    }

    @ReactMethod 
    public void dispose(String ptrKey, Promise promise) {
        try {
            Long ptr = getPtr(ptrKey);
            nativeDispose(ptr.longValue());
            PTR_MAP.remove(ptrKey);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e.getMessage());
        }
    }

    private long getPtr(String ptrKey) throws Exception {
        Long ptr = PTR_MAP.get(ptrKey);

        if (ptr == null) {
            throw new Exception("Pointer with key \"" + ptrKey + "\" doesn't exist.");
        }

        return ptr;
    }

    public static native long nativeInitTagger(String dicdir);
    public static native String nativeParse(long mecabPtr, String query);
    public static native void nativeDispose(long mecabPtr);
}
