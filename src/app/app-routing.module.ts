import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExplorerComponent } from './components/explorer/explorer.component';

const routes: Routes = [
  { path: 'explorer', component: ExplorerComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'explorer' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
