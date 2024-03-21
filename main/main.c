#include "rgb_led.h"
#include "ds18b20.h"

void app_main(void) {
	task_medir_temperatura();
	task_control_leds();
}

