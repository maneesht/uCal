import { Component, OnInit, HostListener } from '@angular/core';
import { TokenHandlerService } from '../token-handler/token-handler.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  isNavBarCollapsed = true;
  constructor( private tokenHandler: TokenHandlerService) { }
  logOut() {
    this.tokenHandler.clearToken();
  }
  ngOnInit() { }
}
