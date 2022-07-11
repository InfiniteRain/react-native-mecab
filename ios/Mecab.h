#import <React/RCTBridgeModule.h>

#ifdef __cplusplus

#import "react-native-mecab.h"

#endif

@interface Mecab : NSObject <RCTBridgeModule> {
    NSMutableDictionary *ptrMap;
}

@end
