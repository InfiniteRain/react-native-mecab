#ifndef RNMECAB_H
#define RNMECAB_H

#include <mecab.h>
#include <string>

namespace rnmecab {
    MeCab::Tagger* initTagger(std::string dicdir);
    std::string parse(MeCab::Tagger* tagger, std::string input);
    void dispose(MeCab::Tagger* tagger);
}

#endif /* RNMECAB_H */
