#include <jni.h>
#include "react-native-mecab.h"

extern "C"
JNIEXPORT jlong JNICALL
Java_com_reactnativemecab_MecabModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return example::multiply(a, b);
}
