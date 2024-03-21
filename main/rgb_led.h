/*
 * rgb_led.h
 *
 *  Created on: MAR 20, 2024
 *
 *  Author: Nicolás
 *
 *  Brief: En este archivo se definen los puertos utilizados para cada color,
 *  el número de canales, la configuración de la estructura y los hardcoding de cada
 *  color
 *
 */

#ifndef MAIN_RGB_LED_H_
#define MAIN_RGB_LED_H_

#include "freertos/FreeRTOS.h"
#include "esp_wifi.h"
#include "esp_system.h"
#include "esp_event.h"
#include "esp_event_loop.h"
#include "nvs_flash.h"
#include "driver/gpio.h"

// RGB LED GPIOs
#define RGB_LED_RED_GPIO		21
#define RGB_LED_GREEN_GPIO		19
#define RGB_LED_BLUE_GPIO		18

// RGB LED color mix channels
#define RGB_LED_CHANNEL_NUM		3

// RGB LED configuration
typedef struct
{
	int channel;
	int gpio;
	int mode;
	int timer_index;
} ledc_info_t;
// ledc_info_t ledc_ch[RGB_LED_CHANNEL_NUM]; Move this declaration to the top of rgb_led.c to avoid linker errors

/**
 * Color to indicate WiFi application has started.
 */
static void rgb_led_wifi_app_started(void);

/**
 * Color to indicate HTTP server has started.
 */
static void rgb_led_http_server_started(void);

/**
 * Color to indicate that the ESP32 is connected to an access point.
 */
static void rgb_led_wifi_connected(void);


/**
 * Test task: This task switches the leds
 */
void leds_test();

void task_control_leds();

#endif /* MAIN_RGB_LED_H_ */
