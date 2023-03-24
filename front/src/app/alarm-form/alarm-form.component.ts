import { Component, OnInit } from '@angular/core';
import { Alarm } from '../models/alarm';
import { WebRadioService } from '../services/webradio.service';
import { Webradio } from '../models/webradio';
import { UntypedFormGroup, UntypedFormControl, ValidatorFn, Validators  } from '@angular/forms';
import { AlarmsService } from '../services/alarms.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-alarm-form',
  templateUrl: './alarm-form.component.html',
  styleUrls: ['./alarm-form.component.scss']
})
export class AlarmFormComponent implements OnInit {

  webradios: Webradio[];
  newAlarm: Alarm = new Alarm({ enabled: true});
  default_time = { hour: 7, minute: 0 };
  dayOfWeek = [
    { name: 'order 1' },
    { name: 'order 2' },
    { name: 'order 3' },
    { name: 'order 4' }
  ];

  form;
  private routeSub: Subscription;
  existingAlarm = false;

  constructor(private webRadioService: WebRadioService,
              private alarmService: AlarmsService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              public toastService: ToastService) { }

  ngOnInit(): void {

    this.createEmptyForm();
    this.existingAlarm = false;
    this.newAlarm.auto_stop_minutes = 0;

    this.routeSub = this.activatedRoute.params.subscribe(params => {
      let alarmId = params['id'];
      if (!alarmId) {
        console.log("no alarm id");

      } else {
        this.alarmService.getAlarmById(alarmId).subscribe(
          newAlarm => {
            this.existingAlarm = true;
            this.newAlarm = newAlarm
            this.createFormFromModel(this.newAlarm);
          },
          error => console.error('Error: ' + error),
          () => console.log('Completed!'));
        console.log(this.newAlarm);
      }
    });

    // get the active web radio
    this.webRadioService.getAllWebRadios().subscribe(this.setWebRadio.bind(this));
  }

  createEmptyForm() {
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl('', [Validators.required]),
      dayOfWeekCheckboxGroup: new UntypedFormGroup({
        monday: new UntypedFormControl(false),
        tuesday: new UntypedFormControl(false),
        wednesday: new UntypedFormControl(false),
        thursday: new UntypedFormControl(false),
        friday: new UntypedFormControl(false),
        saturday: new UntypedFormControl(false),
        sunday: new UntypedFormControl(false),
      }, requireCheckboxesToBeCheckedValidator()),
      time: new UntypedFormControl(this.default_time, [Validators.required]),
      auto_stop_minutes: new UntypedFormControl(0, [Validators.required]),
      webradio: new UntypedFormControl('', [Validators.required])
    });

  }

  createFormFromModel(alarm: Alarm) {
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(alarm.name, [Validators.required]),
      dayOfWeekCheckboxGroup: new UntypedFormGroup({
        monday: new UntypedFormControl(alarm.monday),
        tuesday: new UntypedFormControl(alarm.tuesday),
        wednesday: new UntypedFormControl(alarm.wednesday),
        thursday: new UntypedFormControl(alarm.thursday),
        friday: new UntypedFormControl(alarm.friday),
        saturday: new UntypedFormControl(alarm.saturday),
        sunday: new UntypedFormControl(alarm.sunday),
      }, requireCheckboxesToBeCheckedValidator()),
      time: new UntypedFormControl( { hour: alarm.hour, minute: alarm.minute}, [Validators.required]),
      auto_stop_minutes: new UntypedFormControl(alarm.auto_stop_minutes, [Validators.required]),
      webradio: new UntypedFormControl(alarm.webradio, [Validators.required])
    });
  }


  setWebRadio(webradios: Webradio[]) {
    this.webradios = webradios;
  }

  onSubmit(){
    // map form
    this.newAlarm.name = this.form.value.name;
    this.newAlarm.monday = this.form.value.dayOfWeekCheckboxGroup.monday;
    this.newAlarm.tuesday = this.form.value.dayOfWeekCheckboxGroup.tuesday;
    this.newAlarm.wednesday = this.form.value.dayOfWeekCheckboxGroup.wednesday;
    this.newAlarm.thursday = this.form.value.dayOfWeekCheckboxGroup.thursday;
    this.newAlarm.friday = this.form.value.dayOfWeekCheckboxGroup.friday;
    this.newAlarm.saturday = this.form.value.dayOfWeekCheckboxGroup.saturday;
    this.newAlarm.sunday = this.form.value.dayOfWeekCheckboxGroup.sunday;
    this.newAlarm.hour = this.form.value.time.hour;
    this.newAlarm.minute = this.form.value.time.minute;
    this.newAlarm.auto_stop_minutes = this.form.value.auto_stop_minutes;
    this.newAlarm.webradio = this.form.value.webradio;

    if (this.existingAlarm){
      // update new alarm
      this.alarmService.updateAlarm(this.newAlarm).subscribe(
        success => {
          this.toastService.show('Alarm updated', { classname: 'bg-info text-light', delay: 5000 });
          this.router.navigate(["alarms"]);
        },
        error => {
          console.log(error);
          this.toastService.show('Error', { classname: 'bg-danger text-light', delay: 5000 });
        }
      )

    }else{
      // create existing alarm
      this.alarmService.createAlarm(this.newAlarm).subscribe(
        success => {
          this.toastService.show('Alarm created', { classname: 'bg-info text-light', delay: 5000 });
          this.router.navigate(["alarms"]);
        },
        error => {
          console.log(error);
          this.toastService.show('Error', { classname: 'bg-danger text-light', delay: 5000 });
        }
      )
    }
  }


}

export function requireCheckboxesToBeCheckedValidator(minRequired = 1): ValidatorFn {
  return function validate(formGroup: UntypedFormGroup) {
    let checked = 0;

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];

      if (control.value === true) {
        checked++;
      }
    });

    if (checked < minRequired) {
      return {
        requireCheckboxesToBeChecked: true,
      };
    }

    return null;
  };


}
