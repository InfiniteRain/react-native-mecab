#import "Mecab.h"
#import "react-native-mecab.h"

@implementation Mecab
RCT_EXPORT_MODULE()

-(id) init {
    if (self = [super init])  {
        self->ptrMap = [[NSMutableDictionary alloc] init];
    }
    return self;
}

+(BOOL) requiresMainQueueSetup {
    return NO;
}

RCT_EXPORT_METHOD(initTagger:(nonnull NSString*)dicdir
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject)
{
    id mecabPtr = @((long)rnmecab::initTagger([dicdir UTF8String]));
    id uuid = [NSUUID UUID];
    id key = [uuid UUIDString];
    
    [ptrMap setObject:mecabPtr forKey:key];
    
    resolve(key);
}

RCT_EXPORT_METHOD(parse:(nonnull NSString*)ptrKey
                  withQuery:(nonnull NSString*)query
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject)
{
    if ([ptrMap objectForKey:ptrKey] == nil) {
        reject(@"MeCabError",
               [NSString stringWithFormat:@"Pointer with key \"%@\" doesn't exist.", ptrKey],
               nil);
        return;
    }

    auto tagger = (MeCab::Tagger*)[ptrMap[ptrKey] longValue];
    auto queryString = std::string([query UTF8String]);
    auto result = rnmecab::parse(tagger, queryString);
    
    resolve([NSString stringWithUTF8String:result.c_str()]);
}

RCT_EXPORT_METHOD(dispose:(nonnull NSString*)ptrKey
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject)
{
    if ([ptrMap objectForKey:ptrKey] == nil) {
        reject(@"MeCabError",
               [NSString stringWithFormat:@"Pointer with key \"%@\" doesn't exist.", ptrKey],
               nil);
        return;
    }
    
    auto tagger = (MeCab::Tagger*)[ptrMap[ptrKey] longValue];
    rnmecab::dispose(tagger);
    [ptrMap removeObjectForKey:ptrKey];
    resolve(nil);
}

RCT_EXPORT_METHOD(ptrMap:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject)
{
    resolve(ptrMap);
}

@end
