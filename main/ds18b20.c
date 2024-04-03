/*
 * ds18b20.c
 *
 *  Created on: 20 mar. 2024
 *      Author: Nicolás Almaraz
 */

#include "ds18b20.h"
#include "tasks_common.h"

#define MAX_SENSORS 1

static const gpio_num_t SENSOR_GPIO = 5;
static const int SAMPLES_TEMP = 5;
static const uint32_t TIME_SAMPLE = 500;
static const uint32_t TIME_MEASURE = 5000;

static const char *TAG = "ds18b20";

float g_temp_measure = 25;

/**
 * DS18B20 Sensor Task
 */
static void ds18b20_task(void *pvParameter) {
	float temp;
	float suma_temps = 0;
	esp_err_t res;
	gpio_set_pull_mode(SENSOR_GPIO, GPIO_PULLUP_ONLY);
	printf("Starting DS18B20 Sensor Task");
	onewire_addr_t addr;
	size_t sensor_count = 0;

	//Escaneo
	res = ds18x20_scan_devices(SENSOR_GPIO, &addr, MAX_SENSORS, &sensor_count);
	if (res != ESP_OK) {
		ESP_LOGE(TAG, "Sensors scan error %d (%s)", res, esp_err_to_name(res));
	}
	if (!sensor_count) {
		ESP_LOGW(TAG, "No sensors detected!");
	}
	ESP_LOGI(TAG, "%d sensors detected", sensor_count);

	while (1) {
		//Mido
		//ESP_LOGI(TAG, "Measuring...");
		suma_temps = 0;
		for (int i = 0; i < SAMPLES_TEMP; i++) {
			res = ds18x20_measure_and_read(SENSOR_GPIO, addr, &temp);
			if (res != ESP_OK) {
				ESP_LOGE(TAG, "Sensors read error");
				continue;
			}
			suma_temps += temp;
			vTaskDelay(pdMS_TO_TICKS(TIME_SAMPLE/portTICK_PERIOD_MS));
		}
		g_temp_measure = suma_temps / SAMPLES_TEMP;
		vTaskDelay(pdMS_TO_TICKS(TIME_MEASURE/portTICK_PERIOD_MS));
	}
}

float getTemperature() {
	return g_temp_measure;
}

void DS18B20_task_start(void) {
	xTaskCreatePinnedToCore(ds18b20_task, "ds18b20_task",
	DS18B20_SENSOR_TASK_STACK_SIZE, NULL, DS18B20_SENSOR_TASK_PRIORITY,
	NULL, DS18B20_SENSOR_TASK_CORE_ID);
}

