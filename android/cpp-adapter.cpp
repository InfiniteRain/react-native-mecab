#include <jni.h>
#include "mecab.h"
#include <string>
#include "react-native-mecab.h"

extern "C"
JNIEXPORT jlong JNICALL
Java_com_reactnativemecab_MecabModule_nativeInitTagger(JNIEnv *env, jclass type, jstring jdicdir) {
    auto dicdir = env->GetStringUTFChars(jdicdir, 0);
    auto tagger = rnmecab::initTagger(dicdir);

    // Returning the pointer to Java as a long
    return (long)tagger;
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_reactnativemecab_MecabModule_nativeParse(JNIEnv *env, jclass type, jlong mecabPtr, jstring jquery) {
    auto tagger = (MeCab::Tagger*)mecabPtr;
    auto query = std::string(env->GetStringUTFChars(jquery, 0));
    auto result = rnmecab::parse(tagger, query);

    return env->NewStringUTF(result.c_str());
}

extern "C"
JNIEXPORT void JNICALL
Java_com_reactnativemecab_MecabModule_nativeDispose(JNIEnv *env, jclass type, jlong mecabPtr) {
    auto tagger = (MeCab::Tagger*)mecabPtr;
    rnmecab::dispose(tagger);
}
