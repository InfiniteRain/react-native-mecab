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
        auto node = tagger->parseToNode(input.c_str());
        std::ostringstream resultStream;

        for (; node; node = node->next) {
            resultStream << "surface: " << node->feature << std::endl;
        }

        return resultStream.str();
    }

    void dispose(MeCab::Tagger* tagger) {
        delete tagger;
    }
}
