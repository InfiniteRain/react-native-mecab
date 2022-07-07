#include "react-native-mecab.h"
#include <mecab.h>
#include <sstream>

namespace rnmecab {
	MeCab::Tagger* initTagger(std::string dicdir) {
        std::ostringstream paramStream;
        paramStream << "--dicdir " << dicdir << " --rcfile " << dicdir << "/mecabrc";
        auto paramString = paramStream.str();
        return MeCab::createTagger(paramString.c_str());
	}

    std::string parse(MeCab::Tagger* tagger, std::string input) {
        auto inputStr = input.c_str();
        auto node = tagger->parseToNode(inputStr);
        std::ostringstream resultStream;

        for (; node; node = node->next) {
            if (node->stat == MECAB_BOS_NODE || node->stat == MECAB_EOS_NODE) {
                continue;
            }

            auto surface = std::string(node->surface);

            resultStream
                << surface.substr(0, node->length)
                << ": " 
                << node->feature 
                << std::endl;
        }

        return resultStream.str();
    }

    void dispose(MeCab::Tagger* tagger) {
        delete tagger;
    }
}
