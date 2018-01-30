import { Component, OnInit } from '@angular/core';
import { TokenHandlerService } from '../token-handler/token-handler.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit {

  constructor(private tokenHandler: TokenHandlerService, private activatedRoute: ActivatedRoute, private router: Router) { }
  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((map: ParamMap) => {
      let token = map.get('token');
      this.tokenHandler.setToken(token);
      this.router.navigate(['/calendar']);
    });
  }
}
