import { Pipe, PipeTransform } from '@angular/core';
import { Group } from 'src/entities/group';

@Pipe({
  name: 'groupsToString'
})
export class GroupsToStringPipe implements PipeTransform {

  transform(groups: Group[], property?: string): string {
    if (property === "permissions") {
      return groups.flatMap(group => group.permissions)
        .reduce((acc, perm) => acc.includes(perm) ? acc : [...acc, perm], []).join(', ');
    }
    return groups.map(group => group.name).join(', ');
  }

}
