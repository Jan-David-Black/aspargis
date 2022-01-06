#include "ds18b20.h"
#define NUM 1
unsigned char ROM_NOs[4][8];

const uint16_t pins[4] = {
	GPIO_PIN_3,
	GPIO_PIN_9,
	GPIO_PIN_10,
	GPIO_PIN_10
}; 
void DS18B20_delay(uint16_t time)
{
	uint8_t i;

  while(time)
  {    
    for (i = 0; i < 4; i++);
    time--;
  }
}

void DS18B20_Mode_IPU(uint8_t num)
{
  GPIO_InitTypeDef GPIO_InitStruct;
	__HAL_RCC_GPIOB_CLK_ENABLE();
	GPIO_InitStruct.Pin   = pins[num-1];
	GPIO_InitStruct.Mode  = GPIO_MODE_INPUT;
	GPIO_InitStruct.Pull  = GPIO_PULLUP;
	HAL_GPIO_Init(GPIOB, &GPIO_InitStruct); 
}

void DS18B20_Mode_Out_PP(uint8_t num)
{
  GPIO_InitTypeDef GPIO_InitStruct;
	__HAL_RCC_GPIOB_CLK_ENABLE();
	GPIO_InitStruct.Pin = pins[num-1];
	GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
	GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
	HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);   
}

void DS18B20_IoDeInit(uint8_t num)
{
	GPIO_InitTypeDef GPIO_InitStruct;
	__HAL_RCC_GPIOB_CLK_ENABLE();

	GPIO_InitStruct.Pin = pins[num-1];
	GPIO_InitStruct.Mode = GPIO_MODE_ANALOG;;
	GPIO_InitStruct.Pull = GPIO_NOPULL;
	HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
}

void DS18B20_Rst(uint8_t num)
{
	DS18B20_Mode_Out_PP(1);		
	HAL_GPIO_WritePin(GPIOB,pins[num-1],GPIO_PIN_RESET);
	DS18B20_delay(750);		
	HAL_GPIO_WritePin(GPIOB,pins[num-1],GPIO_PIN_SET);					 
	DS18B20_delay(15);
}

uint8_t DS18B20_Presence(uint8_t num)
{
		uint8_t pulse_time = 0;    
		DS18B20_Mode_IPU(num);
		while( HAL_GPIO_ReadPin(GPIOB,pins[num-1]) && pulse_time<100){
				pulse_time++;
				DS18B20_delay(1);
		}        

		if( pulse_time >=100 )
			return 1;
		else
			pulse_time = 0;
		
		while( !HAL_GPIO_ReadPin(GPIOB,pins[num-1]) && pulse_time<240){
			pulse_time++;
			DS18B20_delay(1);
		}        
		if( pulse_time >=240 )
			return 1;
		else			
			return 0;
}

uint8_t DS18B20_ReadBit(uint8_t num)
{
	uint8_t dat;
             
	DS18B20_Mode_Out_PP(num);

	HAL_GPIO_WritePin(GPIOB,pins[num-1],GPIO_PIN_RESET);
	DS18B20_delay(10);
	DS18B20_Mode_IPU(num);
	
	if(HAL_GPIO_ReadPin(GPIOB,pins[num-1])==SET)
		dat = 1;
	else
		dat = 0;

	DS18B20_delay(45);
	
	return dat;
}

uint8_t DS18B20_ReadByte(uint8_t num)
{
	uint8_t i, j, dat = 0;        
	
	for(i=0; i<8; i++){
		j = DS18B20_ReadBit(num); 	               								
		dat = (dat) | (j<<i);
	}
	
	return dat;
}

void DS18B20_WriteBit(uint8_t dat,uint8_t num)  
{  
	DS18B20_Mode_Out_PP(num);  
	if(dat){  
		HAL_GPIO_WritePin(GPIOB,pins[num-1],GPIO_PIN_RESET);
		DS18B20_delay(8);  
		HAL_GPIO_WritePin(GPIOB,pins[num-1],GPIO_PIN_SET);  
		DS18B20_delay(58);  
	}else{  
		HAL_GPIO_WritePin(GPIOB,pins[num-1],GPIO_PIN_RESET); 
		DS18B20_delay(70);  
		HAL_GPIO_WritePin(GPIOB,pins[num-1],GPIO_PIN_SET);  
		DS18B20_delay(2);  
	} 
}

void DS18B20_WriteByte(uint8_t dat,uint8_t num)
{
	uint8_t i, testb;
	DS18B20_Mode_Out_PP(num);

	for( i=0; i<8; i++ ){
		testb = dat&0x01;
		dat = dat>>1;                
		DS18B20_WriteBit(testb, num);
	}
}

void DS18B20_SkipRom(uint8_t num)
{
		DS18B20_Rst(num);                   
		DS18B20_Presence(num);                 
		DS18B20_WriteByte(0XCC,num);       
}

void DS18B20_SelectRom(uint8_t num)
{
		DS18B20_Rst(NUM);                   
		DS18B20_Presence(NUM); 
		//printArray(ROM_NOs[num-1], 8); 	
		DS18B20_WriteByte(0X55,NUM); 
		for (int i = 0; i <= 7; i++){
			DS18B20_WriteByte(ROM_NOs[num-1][i], NUM);
		}
}

float DS18B20_GetTemp_SkipRom (uint8_t num)
{
	uint8_t tpmsb, tplsb;
	short s_tem;
	float f_tem;
	
	
	DS18B20_SkipRom(num);
	DS18B20_WriteByte(0X44,num);                                
	
	HAL_Delay(750);

	DS18B20_SkipRom (num);
	DS18B20_WriteByte(0XBE,num);                                
	
	tplsb = DS18B20_ReadByte(num);                 
	tpmsb = DS18B20_ReadByte(num); 
	
	if((tpmsb==5)&&(tplsb==80))     //1360= 00000101 01010000,tpmsb=00000101=5,tplsb=01010000=80;  
	{
		DS18B20_SkipRom(num);
		DS18B20_WriteByte(0X44,num);                                
		
		HAL_Delay(750);

		DS18B20_SkipRom (num);
		DS18B20_WriteByte(0XBE,num); 
			
		tplsb = DS18B20_ReadByte(num);                 
		tpmsb = DS18B20_ReadByte(num);
	}
	
	s_tem = tpmsb<<8;
	s_tem = s_tem | tplsb;
	
	if( s_tem < 0 )                
			f_tem = (~s_tem+1) * -0.0625;        
	else
			f_tem = s_tem * 0.0625;
	
	user_main_printf("DS18B20(%d) temp is %.2f deg C",num,f_tem);
	return f_tem;         
}

float DS18B20_GetTemp_SelectRom(uint8_t num)
{
	uint8_t tpmsb, tplsb;
	short s_tem;
	float f_tem;
	
	
	DS18B20_SelectRom(num);
	DS18B20_WriteByte(0X44,NUM);                                
	
	HAL_Delay(750);

	DS18B20_SelectRom(num);
	DS18B20_WriteByte(0XBE,NUM);                                
	
	tplsb = DS18B20_ReadByte(NUM);                 
	tpmsb = DS18B20_ReadByte(NUM); 
	//user_main_printf("readout: %d %d",tpmsb,tplsb);
	
	if((tpmsb==5)&&(tplsb==80))     //1360= 00000101 01010000,tpmsb=00000101=5,tplsb=01010000=80;  
	{
		DS18B20_SelectRom(num);
		DS18B20_WriteByte(0X44,NUM);                                
		
		HAL_Delay(750);

		DS18B20_SelectRom(num);
		DS18B20_WriteByte(0XBE,NUM);  
			
		tplsb = DS18B20_ReadByte(NUM);                 
		tpmsb = DS18B20_ReadByte(NUM); 
	}
	
	s_tem = tpmsb<<8;
	s_tem = s_tem | tplsb;
	
	if( s_tem < 0 )                
			f_tem = (~s_tem+1) * -0.0625;        
	else
			f_tem = s_tem * 0.0625;
	
	user_main_printf("DS18B20(%d) temp is %.2f deg C",num,f_tem);
	return f_tem;         
}


// definitions
#define FALSE 0
#define TRUE  1

// global search state
unsigned char ROM_NO[8];
int LastDiscrepancy;
int LastFamilyDiscrepancy;
int LastDeviceFlag;
unsigned char crc8;

//--------------------------------------------------------------------------
// Find the 'first' devices on the 1-Wire bus
// Return TRUE  : device found, ROM number in ROM_NO buffer
//        FALSE : no device present
//
int OWFirst()
{
   // reset the search state
   LastDiscrepancy = 0;
   LastDeviceFlag = FALSE;
   LastFamilyDiscrepancy = 0;

   return OWSearch();
}

//--------------------------------------------------------------------------
// Find the 'next' devices on the 1-Wire bus
// Return TRUE  : device found, ROM number in ROM_NO buffer
//        FALSE : device not found, end of search
//
int OWNext()
{
   // leave the search state alone
   return OWSearch();
}

//--------------------------------------------------------------------------
// Perform the 1-Wire Search Algorithm on the 1-Wire bus using the existing
// search state.
// Return TRUE  : device found, ROM number in ROM_NO buffer
//        FALSE : device not found, end of search
//
int OWSearch()
{
   int id_bit_number;
   int last_zero, rom_byte_number, search_result;
   int id_bit, cmp_id_bit;
   unsigned char rom_byte_mask, search_direction;

   // initialize for search
   id_bit_number = 1;
   last_zero = 0;
   rom_byte_number = 0;
   rom_byte_mask = 1;
   search_result = 0;
   crc8 = 0;

   // if the last call was not the last one
   if (!LastDeviceFlag)
   {
      // 1-Wire reset
      if (!OWReset())
      {
         // reset the search
         LastDiscrepancy = 0;
         LastDeviceFlag = FALSE;
         LastFamilyDiscrepancy = 0;
         return FALSE;
      }

      // issue the search command 
      OWWriteByte(0xF0);  

      // loop to do the search
      do
      {
         // read a bit and its complement
         id_bit = OWReadBit();
         cmp_id_bit = OWReadBit();
				//user_main_printf("bits read: %d, %d", id_bit, cmp_id_bit);

         // check for no devices on 1-wire
         if ((id_bit == 1) && (cmp_id_bit == 1))
            break;
         else
         {
            // all devices coupled have 0 or 1
            if (id_bit != cmp_id_bit)
               search_direction = id_bit;  // bit write value for search
            else
            {
               // if this discrepancy if before the Last Discrepancy
               // on a previous next then pick the same as last time
               if (id_bit_number < LastDiscrepancy)
                  search_direction = ((ROM_NO[rom_byte_number] & rom_byte_mask) > 0);
               else
                  // if equal to last pick 1, if not then pick 0
                  search_direction = (id_bit_number == LastDiscrepancy);

               // if 0 was picked then record its position in LastZero
               if (search_direction == 0)
               {
                  last_zero = id_bit_number;

                  // check for Last discrepancy in family
                  if (last_zero < 9)
                     LastFamilyDiscrepancy = last_zero;
               }
            }

            // set or clear the bit in the ROM byte rom_byte_number
            // with mask rom_byte_mask
            if (search_direction == 1)
              ROM_NO[rom_byte_number] |= rom_byte_mask;
            else
              ROM_NO[rom_byte_number] &= ~rom_byte_mask;

            // serial number search direction write bit
            OWWriteBit(search_direction);

            // increment the byte counter id_bit_number
            // and shift the mask rom_byte_mask
            id_bit_number++;
            rom_byte_mask <<= 1;

            // if the mask is 0 then go to new SerialNum byte rom_byte_number and reset mask
            if (rom_byte_mask == 0)
            {
                docrc8(ROM_NO[rom_byte_number]);  // accumulate the CRC
                rom_byte_number++;
                rom_byte_mask = 1;
            }
         }
      }
      while(rom_byte_number < 8);  // loop until through all ROM bytes 0-7

      // if the search was successful then
      if (!((id_bit_number < 65) || (crc8 != 0)))
      {
         // search successful so set LastDiscrepancy,LastDeviceFlag,search_result
         LastDiscrepancy = last_zero;

         // check for last device
         if (LastDiscrepancy == 0)
            LastDeviceFlag = TRUE;
         
         search_result = TRUE;
      }
   }

   // if no device found then reset counters so next 'search' will be like a first
   if (!search_result || !ROM_NO[0])
   {
      LastDiscrepancy = 0;
      LastDeviceFlag = FALSE;
      LastFamilyDiscrepancy = 0;
      search_result = FALSE;
   }

   return search_result;
}

//--------------------------------------------------------------------------
// Verify the device with the ROM number in ROM_NO buffer is present.
// Return TRUE  : device verified present
//        FALSE : device not present
//
int OWVerify()
{
   unsigned char rom_backup[8];
   int i,rslt,ld_backup,ldf_backup,lfd_backup;

   // keep a backup copy of the current state
   for (i = 0; i < 8; i++)
      rom_backup[i] = ROM_NO[i];
   ld_backup = LastDiscrepancy;
   ldf_backup = LastDeviceFlag;
   lfd_backup = LastFamilyDiscrepancy;

   // set search to find the same device
   LastDiscrepancy = 64;
   LastDeviceFlag = FALSE;

   if (OWSearch())
   {
      // check if same device found
      rslt = TRUE;
      for (i = 0; i < 8; i++)
      {
         if (rom_backup[i] != ROM_NO[i])
         {
            rslt = FALSE;
            break;
         }
      }
   }
   else
     rslt = FALSE;

   // restore the search state 
   for (i = 0; i < 8; i++)
      ROM_NO[i] = rom_backup[i];
   LastDiscrepancy = ld_backup;
   LastDeviceFlag = ldf_backup;
   LastFamilyDiscrepancy = lfd_backup;

   // return the result of the verify
   return rslt;
}

//--------------------------------------------------------------------------
// Setup the search to find the device type 'family_code' on the next call
// to OWNext() if it is present.
//
void OWTargetSetup(unsigned char family_code)
{
   int i;

   // set the search state to find SearchFamily type devices
   ROM_NO[0] = family_code;
   for (i = 1; i < 8; i++)
      ROM_NO[i] = 0;
   LastDiscrepancy = 64;
   LastFamilyDiscrepancy = 0;
   LastDeviceFlag = FALSE;
}

//--------------------------------------------------------------------------
// Setup the search to skip the current device type on the next call
// to OWNext().
//
void OWFamilySkipSetup()
{
   // set the Last discrepancy to last family discrepancy
   LastDiscrepancy = LastFamilyDiscrepancy;
   LastFamilyDiscrepancy = 0;

   // check for end of list
   if (LastDiscrepancy == 0)
      LastDeviceFlag = TRUE;
}

//--------------------------------------------------------------------------
// 1-Wire Functions to be implemented for a particular platform
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// Reset the 1-Wire bus and return the presence of any device
// Return TRUE  : device present
//        FALSE : no device present
//
int OWReset()
{
   // platform specific
   // TMEX API TEST BUILD
	DS18B20_Rst(NUM);
	DS18B20_Presence(NUM);
	//user_main_printf("DS18B20 reset");
  return 1;
}

//--------------------------------------------------------------------------
// Send 8 bits of data to the 1-Wire bus
//
void OWWriteByte(unsigned char byte_value)
{
   // platform specific
   
   // TMEX API TEST BUILD
   DS18B20_WriteByte((short)byte_value, NUM);
}

//--------------------------------------------------------------------------
// Send 1 bit of data to teh 1-Wire bus
//
void OWWriteBit(unsigned char bit_value)
{
   // platform specific

   // TMEX API TEST BUILD
   DS18B20_WriteBit((short)bit_value, NUM);
}

//--------------------------------------------------------------------------
// Read 1 bit of data from the 1-Wire bus 
// Return 1 : bit read is 1
//        0 : bit read is 0
//
unsigned char OWReadBit()
{
   // platform specific

   // TMEX API TEST BUILD
   return (unsigned char)DS18B20_ReadBit(NUM);

}

// TEST BUILD
static unsigned char dscrc_table[] = {
        0, 94,188,226, 97, 63,221,131,194,156,126, 32,163,253, 31, 65,
      157,195, 33,127,252,162, 64, 30, 95,  1,227,189, 62, 96,130,220,
       35,125,159,193, 66, 28,254,160,225,191, 93,  3,128,222, 60, 98,
      190,224,  2, 92,223,129, 99, 61,124, 34,192,158, 29, 67,161,255,
       70, 24,250,164, 39,121,155,197,132,218, 56,102,229,187, 89,  7,
      219,133,103, 57,186,228,  6, 88, 25, 71,165,251,120, 38,196,154,
      101, 59,217,135,  4, 90,184,230,167,249, 27, 69,198,152,122, 36,
      248,166, 68, 26,153,199, 37,123, 58,100,134,216, 91,  5,231,185,
      140,210, 48,110,237,179, 81, 15, 78, 16,242,172, 47,113,147,205,
       17, 79,173,243,112, 46,204,146,211,141,111, 49,178,236, 14, 80,
      175,241, 19, 77,206,144,114, 44,109, 51,209,143, 12, 82,176,238,
       50,108,142,208, 83, 13,239,177,240,174, 76, 18,145,207, 45,115,
      202,148,118, 40,171,245, 23, 73,  8, 86,180,234,105, 55,213,139,
       87,  9,235,181, 54,104,138,212,149,203, 41,119,244,170, 72, 22,
      233,183, 85, 11,136,214, 52,106, 43,117,151,201, 74, 20,246,168,
      116, 42,200,150, 21, 75,169,247,182,232, 10, 84,215,137,107, 53};

//--------------------------------------------------------------------------
// Calculate the CRC8 of the byte value provided with the current 
// global 'crc8' value. 
// Returns current global crc8 value
//
unsigned char docrc8(unsigned char value)
{
   // See Application Note 27
   
   // TEST BUILD
   crc8 = dscrc_table[crc8 ^ value];
   return crc8;
}


void print_all_one_wire(){
	int rslt,i,cnt;

	user_main_printf("FIND ALL");
	cnt = 0;
	rslt = OWFirst();
	while (rslt){
	// print device found
		if(cnt>=4)break;
		for (i = 7; i >= 0; i--){
			//user_main_printf("%02X", ROM_NO[i]);
			ROM_NOs[cnt][i] = ROM_NO[i];
		}
		printArray(ROM_NOs[cnt], 8);
		//user_main_printf("  %d\n",cnt);
		cnt++;
		rslt = OWNext();
	}
}

char* DS18B20_printToString(int num){
	char* string = (char*) malloc(2*sizeof(char)*12 +1);
	memset(string,0,sizeof((char*)string));
	for (int i = 0; i < 8; i++) { 	sprintf(string+strlen(string), "%02X", ROM_NOs[num][i]);}
	return string;
}


void printArray(unsigned char *array, int length)
{
	char* toPrint = (char*) malloc(2*sizeof(char)*length +1);
	memset(toPrint,0,sizeof((char*)toPrint));
	for (int i = 0; i < length; i++) { 	sprintf(toPrint+strlen(toPrint), "%02X", array[i]);}
	user_main_printf("%s", toPrint);
}
