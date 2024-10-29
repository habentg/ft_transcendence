from django.db import models

""" 
FriendList model
    * one-to-one relationship with Player - every player will have only one friend list and every friend list belongs to only one player
    * many-to-many relationship:- - every player can have many friends and every player (friend) can be a friend of many players
    * if the player is deleted, the friend list will also be deleted
    * related names allows us to access the friend list of a player using the player object - player.friend_list
 """
class FriendList(models.Model):
    player = models.OneToOneField('account.Player', on_delete=models.CASCADE, related_name='friend_list')
    friends = models.ManyToManyField('account.Player', blank=True)
    
    class Meta:
        db_table = 'player_friend_list'

    def __str__(self):

        return self.player.username
    """ adding friend is bidirectional - add to both sides """
    def add_friend(self, new_friend):
        if not new_friend in self.friends.all():
            self.friends.add(new_friend)
            new_friend.friend_list.friends.add(self.player)
            self.save()
    
    """ removing frineds is bidirectional - remove from both sides """
    def remove_friend(self, friend):
        try:
            self.friends.remove(friend)
            friend.friend_list.friends.remove(self.player)
        except Exception as e:
            raise e

""" ----------------- FriendRequest model ----------------- """
""" 
    * model to give the player the option to accept or decline a friend request (sent by another player)
    * simple table with:
        -> a sender for friend request.
        -> a receiver for friend request.
        -> status of the request (pending, accepted, declined).
"""
class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
        ('CANCELLED', 'cancelled'),
    ]
    
    sender = models.ForeignKey('account.Player', on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey('account.Player', on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent duplicate requests between the same users - will not create multiple entries.
        unique_together = ['sender', 'receiver']
        db_table = 'friend_request'
        
    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username} : ({self.status})"

    def accept(self):
        """Accept the friend request and create the friendship"""
        if self.status != 'PENDING':
            raise ValueError("This request is no longer pending")
            
        # Update request status
        self.status = 'ACCEPTED'
        self.save()
        
        # Add to both players' friend lists
        sender_friends, _ = FriendList.objects.get_or_create(player=self.sender)
        receiver_friends, _ = FriendList.objects.get_or_create(player=self.receiver)
        
        sender_friends.friends.add(self.receiver)
        receiver_friends.friends.add(self.sender)

    def decline(self):
        """Decline the friend request"""
        self.status = 'DECLINED'
        self.save()

    # def cancel(self):
    #     """Decline the friend request"""
    #     self.status = 'CANCELLED'
    #     self.save()

    # def getSender(self):
    #     return self.sender.username
    
    # def getReceiver(self):
    #     return self.receiver.username