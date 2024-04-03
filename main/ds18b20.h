/*
 * ds18b20.h
 *
 *  Created on: 20 mar. 2024
 *      Author: User
 */

#ifndef MAIN_DS18B20_H_
#define MAIN_DS18B20_H_

#include <inttypes.h>
#include <stdio.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <ds18x20.h>
#include <esp_log.h>
#include <esp_err.h>

#define DS18B20_GPIO 5


/**
 * Starts DS18B20 sensor task
 */
void DS18B20_task_start(void);

/**
 *
 */
float getTemperature();

#endif /* MAIN_DS18B20_H_ */
