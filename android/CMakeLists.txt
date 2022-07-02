cmake_minimum_required(VERSION 3.4.1)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 11)

add_library(cpp
            SHARED
            ../cpp/mecab/char_property.cpp 
            ../cpp/mecab/eval.cpp
            ../cpp/mecab/nbest_generator.cpp
            ../cpp/mecab/tokenizer.cpp
            ../cpp/mecab/connector.cpp
            ../cpp/mecab/iconv_utils.cpp
            ../cpp/mecab/param.cpp
            ../cpp/mecab/utils.cpp
            ../cpp/mecab/context_id.cpp
            ../cpp/mecab/libmecab.cpp
            ../cpp/mecab/string_buffer.cpp
            ../cpp/mecab/viterbi.cpp
            ../cpp/mecab/dictionary.cpp
            ../cpp/mecab/tagger.cpp
            ../cpp/mecab/writer.cpp
            ../cpp/react-native-mecab.cpp
            cpp-adapter.cpp
)

# Specifies a path to native header files.
include_directories(
            ../cpp
            ../cpp/mecab
)
