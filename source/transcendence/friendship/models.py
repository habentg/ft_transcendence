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
        # if not new_friend in self.friends.all():
        if not self.friends.filter(id=new_friend.id).exists():
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
        try:
            sender_friends.add_friend(self.receiver)
            receiver_friends.add_friend(self.sender)
        except Exception as e:
            print("Error adding friends: ", e, flush=True)
            raise e
        print(f"Friendship created between {self.sender.username} and {self.receiver.username}", flush=True)

    def decline(self):
        """Decline the friend request"""
        self.status = 'DECLINED'
        self.save()

    def cancel(self):
        """Decline the friend request"""
        self.status = 'CANCELLED'
        self.save()

# """ Notification model """
class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey('account.Player', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20)
    sender = models.ForeignKey('account.Player', on_delete=models.CASCADE, related_name='sent_notifications', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_status = models.BooleanField(default=False)

    class Meta:
        db_table = 'notifications_table'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.player.username} - {self.notification_type}"
    
    @property
    def sender_profile_picture(self):
        return self.sender.profile_picture

    @property
    def sender_username(self):
        return self.sender.username
    

# """ ChatMessage model """
class ChatMessage(models.Model):
    sender = models.ForeignKey('account.Player', related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey('account.Player', related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']  # Order messages by timestamp

    def __str__(self):
        return f"{self.sender.username} to {self.recipient.username}: {self.content[:10]}..."