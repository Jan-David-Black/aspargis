#ifndef __DS18B20_H
#define __DS18B20_H

#include "common.h"

void DS18B20_delay(uint16_t time);
void DS18B20_Mode_IPU(uint8_t num);
void DS18B20_Mode_Out_PP(uint8_t num);
void DS18B20_IoDeInit(uint8_t num);
void DS18B20_Rst(uint8_t num);
uint8_t DS18B20_Presence(uint8_t num);
uint8_t DS18B20_ReadBit(uint8_t num);
uint8_t DS18B20_ReadByte(uint8_t num);
void DS18B20_WriteBit(uint8_t dat,uint8_t num);
void DS18B20_WriteByte(uint8_t dat,uint8_t num);
void DS18B20_SkipRom(uint8_t num);
void DS18B20_SelectRom(uint8_t num);
float DS18B20_GetTemp_SkipRom (uint8_t num);
float DS18B20_GetTemp_SelectRom (uint8_t num);

// method declarations
int  OWFirst(void);
int  OWNext(void);
int  OWVerify(void);
void OWTargetSetup(unsigned char family_code);
void OWFamilySkipSetup(void);
int  OWReset(void);
void OWWriteByte(unsigned char byte_value);
void OWWriteBit(unsigned char bit_value);
unsigned char OWReadBit(void);
int  OWSearch(void);
unsigned char docrc8(unsigned char value);
void print_all_one_wire(void);
void printArray(unsigned char *array, int length);
char* DS18B20_printToString(int);

#endif
