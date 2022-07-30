#import "Mecab.h"
#import "react-native-mecab.h"

@interface Mecab() {
    NSMutableDictionary<NSString*, NSValue*>* ptrMap;
}
@end

@implementation Mecab
RCT_EXPORT_MODULE()

- (id)init {
    if (self = [super init])  {
        ptrMap = [NSMutableDictionary new];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

RCT_EXPORT_METHOD(initTagger:(nonnull NSString*)dicdir
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject) {
    auto mecabPtr = [NSValue valueWithPointer:rnmecab::initTagger(dicdir.UTF8String)];
    auto uuid = NSUUID.UUID;
    auto key = uuid.UUIDString;
    
    ptrMap[key] = mecabPtr;
    
    resolve(key);
}

RCT_EXPORT_METHOD(parse:(nonnull NSString*)ptrKey
                  withQuery:(nonnull NSString*)query
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject) {
    if (ptrMap[ptrKey] == nil) {
        reject(@"MeCabError",
               [NSString stringWithFormat:@"Pointer with key \"%@\" doesn't exist.", ptrKey],
               nil);
        return;
    }

    auto tagger = (MeCab::Tagger*)ptrMap[ptrKey].pointerValue;
    auto queryString = std::string(query.UTF8String);
    auto result = rnmecab::parse(tagger, queryString);
    
    resolve([NSString stringWithUTF8String:result.c_str()]);
}

RCT_EXPORT_METHOD(dispose:(nonnull NSString*)ptrKey
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject) {
    if (ptrMap[ptrKey] == nil) {
        reject(@"MeCabError",
               [NSString stringWithFormat:@"Pointer with key \"%@\" doesn't exist.", ptrKey],
               nil);
        return;
    }
    
    auto tagger = (MeCab::Tagger*)ptrMap[ptrKey].pointerValue;
    rnmecab::dispose(tagger);
    [ptrMap removeObjectForKey:ptrKey];
    resolve(nil);
}

@end
