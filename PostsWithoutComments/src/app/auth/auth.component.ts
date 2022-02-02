import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CognitoUserInterface, AuthState, onAuthUIStateChange} from '@aws-amplify/ui-components';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  user: CognitoUserInterface | undefined;
  authState: AuthState;
  constructor(
    private ref: ChangeDetectorRef
    ) {}

  ngOnInit(): void {
    onAuthUIStateChange((resAuthState, resAuthData) => {
      this.authState = resAuthState;
      this.user = resAuthData as CognitoUserInterface | undefined;
      this.ref.detectChanges();
    });
  }

  ngOnDestroy() {
    return onAuthUIStateChange;
  }

}
